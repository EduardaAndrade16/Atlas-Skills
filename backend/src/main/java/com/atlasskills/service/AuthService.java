package com.atlasskills.service;

import com.atlasskills.exception.BadRequestException;
import com.atlasskills.exception.EmailAlreadyExistsException;
import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.*;
import com.atlasskills.model.entity.User;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.model.enums.Role;
import com.atlasskills.repository.UserProfileRepository;
import com.atlasskills.repository.UserRepository;
import com.atlasskills.security.JwtTokenProvider;
import com.atlasskills.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new EmailAlreadyExistsException("Já existe uma conta cadastrada com este e-mail.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create initial profile for the user
        UserProfile initialProfile = UserProfile.builder()
                .user(savedUser)
                .headline("Profissional em Desenvolvimento")
                .primaryArea("Tecnologia da Informação")
                .careerGoal("Crescimento Profissional")
                .secondaryAreas(new ArrayList<>())
                .build();

        UserProfile savedProfile = userProfileRepository.save(initialProfile);

        String token = tokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail());

        return buildAuthResponse(savedUser, savedProfile, token);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserProfile p = UserProfile.builder()
                            .user(user)
                            .primaryArea("Tecnologia da Informação")
                            .careerGoal("Crescimento Profissional")
                            .build();
                    return userProfileRepository.save(p);
                });

        return buildAuthResponse(user, profile, token);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("A senha atual fornecida está incorreta.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new BadRequestException("Nenhum usuário autenticado encontrado no contexto de segurança.");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário autenticado não existe no banco de dados."));
    }

    private AuthResponse buildAuthResponse(User user, UserProfile profile, String token) {
        AuthResponse.UserSummaryDto userSummary = AuthResponse.UserSummaryDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();

        UserProfileDto profileDto = UserProfileDto.builder()
                .id(profile.getId())
                .userId(user.getId())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .primaryArea(profile.getPrimaryArea())
                .secondaryAreas(profile.getSecondaryAreas())
                .careerGoal(profile.getCareerGoal())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .updatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null)
                .build();

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(userSummary)
                .profile(profileDto)
                .build();
    }
}

package com.atlasskills.controller;

import com.atlasskills.model.dto.AuthResponse;
import com.atlasskills.model.dto.LoginRequest;
import com.atlasskills.model.dto.RegisterRequest;
import com.atlasskills.model.dto.UserProfileDto;
import com.atlasskills.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("Deve cadastrar novo usuário com sucesso e retornar token JWT e código 201")
    void shouldRegisterNewUserSuccessfully() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Eduarda Andrade")
                .email("eduarda.teste@atlasskills.com")
                .password("senhaSegura123")
                .build();

        AuthResponse mockResponse = AuthResponse.builder()
                .token("mocked-jwt-token-xyz")
                .type("Bearer")
                .user(AuthResponse.UserSummaryDto.builder()
                        .id(1L)
                        .name("Eduarda Andrade")
                        .email("eduarda.teste@atlasskills.com")
                        .role("ROLE_USER")
                        .build())
                .profile(UserProfileDto.builder()
                        .id(1L)
                        .userId(1L)
                        .headline("Engenheira de Software")
                        .primaryArea("Desenvolvimento Backend & Cloud")
                        .careerGoal("Tech Lead")
                        .build())
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token-xyz"))
                .andExpect(jsonPath("$.user.email").value("eduarda.teste@atlasskills.com"))
                .andExpect(jsonPath("$.profile.primaryArea").value("Desenvolvimento Backend & Cloud"));
    }

    @Test
    @DisplayName("Deve rejeitar cadastro com dados inválidos e retornar 400 Bad Request")
    void shouldRejectInvalidRegistrationData() throws Exception {
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .name("") // Nome vazio (inválido)
                .email("email-invalido") // Sem @ (inválido)
                .password("123") // Menor que 6 caracteres (inválido)
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    @DisplayName("Deve realizar login e retornar 200 OK com token JWT válido")
    void shouldLoginSuccessfully() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("eduarda.teste@atlasskills.com")
                .password("senhaSegura123")
                .build();

        AuthResponse mockResponse = AuthResponse.builder()
                .token("jwt-session-token-456")
                .type("Bearer")
                .user(AuthResponse.UserSummaryDto.builder()
                        .id(1L)
                        .name("Eduarda Andrade")
                        .email("eduarda.teste@atlasskills.com")
                        .role("ROLE_USER")
                        .build())
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-session-token-456"))
                .andExpect(jsonPath("$.type").value("Bearer"));
    }
}

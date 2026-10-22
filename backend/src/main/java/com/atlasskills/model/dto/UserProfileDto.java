package com.atlasskills.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Long id;
    private Long userId;
    private String headline;
    private String bio;

    @NotBlank(message = "A área principal de atuação é obrigatória.")
    private String primaryArea;

    private List<String> secondaryAreas;

    @NotBlank(message = "O objetivo profissional ou cargo desejado é obrigatório.")
    private String careerGoal;

    private String phone;
    private String location;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String updatedAt;
}

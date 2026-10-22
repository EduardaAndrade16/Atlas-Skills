package com.atlasskills.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationDto {
    private Long id;

    @NotBlank(message = "O título da certificação é obrigatório.")
    private String name;

    @NotBlank(message = "O órgão emissor é obrigatório.")
    private String issuingOrganization;

    @NotNull(message = "A data de emissão é obrigatória.")
    private LocalDate issueDate;

    private LocalDate expirationDate;
    private String credentialId;
    private String credentialUrl;
    private String createdAt;
}

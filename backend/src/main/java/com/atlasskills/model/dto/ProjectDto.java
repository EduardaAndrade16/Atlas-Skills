package com.atlasskills.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private Long id;

    @NotBlank(message = "O título do projeto é obrigatório.")
    private String title;

    @NotBlank(message = "A descrição do projeto é obrigatória.")
    private String description;

    private List<String> technologies;

    @NotBlank(message = "O papel desempenhado é obrigatório.")
    private String role;

    private String repositoryUrl;
    private String liveUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private String createdAt;
}

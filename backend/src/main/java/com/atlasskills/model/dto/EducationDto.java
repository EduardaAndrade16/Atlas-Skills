package com.atlasskills.model.dto;

import com.atlasskills.model.enums.EducationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationDto {
    private Long id;

    @NotBlank(message = "A instituição é obrigatória.")
    private String institution;

    @NotBlank(message = "O grau acadêmico é obrigatório.")
    private String degree;

    @NotBlank(message = "O curso ou área de estudo é obrigatório.")
    private String fieldOfStudy;

    @NotNull(message = "O status da formação é obrigatório.")
    private EducationStatus status;

    @NotNull(message = "A data de início é obrigatória.")
    private LocalDate startDate;

    private LocalDate endDate;
    private String createdAt;
}

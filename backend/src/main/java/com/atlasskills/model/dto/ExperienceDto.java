package com.atlasskills.model.dto;

import com.atlasskills.model.enums.WorkModel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceDto {
    private Long id;

    @NotBlank(message = "O nome da empresa é obrigatório.")
    private String company;

    @NotBlank(message = "O cargo é obrigatório.")
    private String position;

    @NotNull(message = "O modelo de trabalho é obrigatório.")
    private WorkModel workModel;

    @NotNull(message = "A data de início é obrigatória.")
    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    private Boolean isCurrent = false;

    @NotBlank(message = "A descrição das atividades desempenhadas é obrigatória.")
    private String activities;

    private String createdAt;
}

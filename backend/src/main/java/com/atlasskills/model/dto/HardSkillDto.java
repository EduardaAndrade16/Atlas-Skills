package com.atlasskills.model.dto;

import com.atlasskills.model.enums.SkillLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HardSkillDto {
    private Long id;

    @NotBlank(message = "O nome da competência técnica é obrigatório.")
    private String name;

    @NotBlank(message = "A categoria é obrigatória.")
    private String category;

    @NotNull(message = "O nível de proficiência é obrigatório.")
    private SkillLevel level;

    @Min(value = 0, message = "Os anos de experiência não podem ser negativos.")
    private Integer yearsOfExperience;

    private String createdAt;
}

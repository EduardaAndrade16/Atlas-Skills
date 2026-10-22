package com.atlasskills.model.dto;

import com.atlasskills.model.enums.SkillLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoftSkillDto {
    private Long id;

    @NotBlank(message = "O nome da soft skill é obrigatório.")
    private String name;

    private String description;

    @NotNull(message = "O nível de domínio é obrigatório.")
    private SkillLevel level;

    private String contextExample;
    private String createdAt;
}

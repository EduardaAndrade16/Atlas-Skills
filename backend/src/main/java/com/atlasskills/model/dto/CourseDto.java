package com.atlasskills.model.dto;

import com.atlasskills.model.enums.CourseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDto {
    private Long id;

    @NotBlank(message = "O nome do curso é obrigatório.")
    private String name;

    @NotBlank(message = "A instituição é obrigatória.")
    private String institution;

    private Integer workloadHours;

    @NotNull(message = "O status do curso é obrigatório.")
    private CourseStatus status;

    private LocalDate startDate;
    private LocalDate completionDate;
    private String certificateUrl;
    private String createdAt;
}

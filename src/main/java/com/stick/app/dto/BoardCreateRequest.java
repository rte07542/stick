package com.stick.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BoardCreateRequest {

    @NotBlank(message = "보드 이름을 입력하세요")
    private String name;

    @NotNull(message = "스페이스 ID가 필요합니다")
    private Long spaceId;

    private String description;
}

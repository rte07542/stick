package com.stick.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class MemoCreateRequest {

    @NotBlank(message = "내용을 입력하세요")
    private String content;

    @NotNull(message = "보드 ID가 필요합니다")
    private Long boardId;

    private Long authorId;

    private String color;

    private List<Long> attachmentIds;
}

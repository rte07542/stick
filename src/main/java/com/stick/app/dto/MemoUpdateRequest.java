package com.stick.app.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.List;

@Getter
public class MemoUpdateRequest {
    @Size(max = 2000, message = "메모는 최대 2000자까지 입력할 수 있습니다.")
    private String content;

    private String color;

    private List<Long> attachmentIds;
}

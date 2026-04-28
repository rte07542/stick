package com.stick.app.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class MemoUpdateRequest {
    private String content;
    private String color;
    private List<Long> attachmentIds;
}

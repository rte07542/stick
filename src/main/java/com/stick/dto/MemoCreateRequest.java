package com.stick.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class MemoCreateRequest {
    private String content;
    private Long boardId;
    private Long authorId;
    private String color;
    private List<Long> attachmentIds;
}

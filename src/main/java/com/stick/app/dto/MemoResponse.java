package com.stick.app.dto;

import com.stick.app.domain.memo.Memo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MemoResponse {
    private Long id;
    private Long boardId;
    private Long authorId;
    private String authorNickname;
    private String content;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<UploadFileResponse> attachments;

    public static MemoResponse from(Memo memo) {
        return MemoResponse.builder()
                .id(memo.getId())
                .boardId(memo.getBoard().getId())
                .authorId(memo.getAuthorId())
                .content(memo.getContent())
                .color(memo.getColor())
                .createdAt(memo.getCreatedAt())
                .updatedAt(memo.getUpdatedAt())
                .attachments(
                        memo.getAttachments() == null
                        ? List.of()
                                : memo.getAttachments().stream()
                                .map(UploadFileResponse::from)
                                .toList()
                )
                .build();
    }

    public static MemoResponse from(Memo memo, String authorNickname) {
        return MemoResponse.builder()
                .id(memo.getId())
                .boardId(memo.getBoard().getId())
                .authorId(memo.getAuthorId())
                .authorNickname(authorNickname)
                .content(memo.getContent())
                .color(memo.getColor())
                .createdAt(memo.getCreatedAt())
                .updatedAt(memo.getUpdatedAt())
                .attachments(
                        memo.getAttachments() == null
                        ? List.of()
                                : memo.getAttachments().stream()
                                .map(UploadFileResponse::from)
                                .toList()
                )
                .build();
    }
}

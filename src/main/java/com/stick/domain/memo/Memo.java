package com.stick.domain.memo;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Memo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long boardId;

    private Long authorId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String color;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
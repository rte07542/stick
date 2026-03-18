package com.stick.domain.memo;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.stick.domain.board.Board;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    @JsonBackReference
    private Board board;

    private Long authorId;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
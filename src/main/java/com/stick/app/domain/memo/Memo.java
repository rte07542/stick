package com.stick.app.domain.memo;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.stick.app.domain.board.Board;
import com.stick.app.domain.uploadeFile.UploadFile;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private Board board;

    private Long authorId;
    private String content;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "memo", cascade = CascadeType.ALL, orphanRemoval = false)
    @Builder.Default
    @JsonManagedReference
    private List<UploadFile> attachments = new ArrayList<>();
}
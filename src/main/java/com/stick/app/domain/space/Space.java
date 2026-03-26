package com.stick.app.domain.space;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.stick.app.domain.board.Board;
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
public class Space {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; //스페이스 생성자

    @Column(length = 500)
    private String description;//스페이스 설명

    @Column(nullable = false)
    private LocalDateTime createdAt;//생성 시간

    @Column(nullable = false)
    private LocalDateTime updatedAt; //수정 시간

    @OneToMany(mappedBy = "space", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Board> boards = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

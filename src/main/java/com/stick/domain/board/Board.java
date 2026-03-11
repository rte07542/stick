package com.stick.domain.board;

import com.stick.domain.space.Space;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;

    private String name;

    private Integer sortOrder; //정렬 순서 번호

    private String description; //보드 설명

    private LocalDateTime createdAt; //생성 시간

    private LocalDateTime updatedAt; //수정 시간
}
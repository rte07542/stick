package com.stick.domain.board;

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

    private Long spaceId;

    private String name;

    private Integer sortOrder; //정렬 순서 번호

    private LocalDateTime createdAt; //생성 시간

    private LocalDateTime updatedAt; //수정 시간
}
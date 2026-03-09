package com.stick.domain.space;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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

    private String name;

    private Long ownerId; //스페이스 생성자

    private String description; //스페이스 설명

    private LocalDateTime createdAt; //생성 시간

    private LocalDateTime updatedAt; //수정 시간
}

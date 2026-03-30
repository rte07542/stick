package com.stick.app.domain.space;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.stick.global.domain.BaseEntity;
import com.stick.app.domain.board.Board;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Space extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; //스페이스 생성자

    @Column(length = 500)
    private String description;//스페이스 설명

    @OneToMany(mappedBy = "space", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Board> boards = new ArrayList<>();
}

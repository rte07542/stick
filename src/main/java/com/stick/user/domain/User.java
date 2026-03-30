package com.stick.user.domain;

import com.stick.global.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true,length = 50)
    private String loginId; //로그인 아이디

    @Column(nullable = false)
    private String password; //비밀번호

    @Column(nullable = false, unique = true, length = 50)
    private String nickname; //표시 이름
}

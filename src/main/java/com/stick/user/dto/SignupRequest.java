package com.stick.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    @NotBlank(message = "아이디를 입력하세요")
    @Size(min =4, max = 20, message = "아이디는 4~20자여야 합니다.")
    private String loginId;

    @NotBlank(message = "비밀번호를 입력하세요")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "닉네임을 입력하세요")
    @Size(max = 15, message = "닉네임은 15자 이하여야 합니다")
    private String nickname;

    private boolean ageConfirmed;
}

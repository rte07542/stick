package com.stick.user.service;

import com.stick.user.domain.User;
import com.stick.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User signup(String loginId, String password, String nickname, boolean ageConfirmed) {
        if (!ageConfirmed) {
            throw new IllegalArgumentException("어린이는 가라. 여긴 으른만의 세계다");
        }
        if(loginId == null || loginId.isBlank()){
            throw new IllegalArgumentException("아이디를 입력해야지");
        }
        if(password == null || password.isBlank()) {
            throw new IllegalArgumentException("비밀번호 입력해야지");
        }
        if(nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임을 입력하세요");
        }
        if(userRepository.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 사용 중인 아이디");
        }
        User user = User.builder()
                .loginId(loginId)
                .password(password)
                .nickname(nickname)
                .build();

        return userRepository.save(user);
    }

    public User login(String loginId, String password) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(()->new IllegalArgumentException("정보가 일치하지 않음"));
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("정보가 일치하지 않음");
        }
        return user;
    }

    public User createUser(String loginId, String password, String nickname) {
        if(userRepository.existsByLoginId(loginId)){
            throw new IllegalArgumentException("이미 존재하는 로그인 아이디");
        }
        if(userRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException("이미 존재하는 닉네임");
        }

        User user = User.builder()
                .loginId(loginId)
                .password(password)
                .nickname(nickname)
                .build();

        return userRepository.save(user);
    }
    public User getUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(()->new IllegalArgumentException("없는 유저"));
    }
}

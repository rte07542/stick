package com.stick.service;

import com.stick.domain.space.Space;
import com.stick.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository spaceRepository; //레포지토리 연결
    // private final = 생성자 주입 + 객체 변경 방지
    /*
        private : 이 변수는 이 클래스 안에서만 사용
        final : 한번 값이 들어가면 다시 바꿀 수 없음
    */

    public Space createSpace(String name, Long ownerId, String description) {
        Space space = Space.builder()
                .name(name)
                .ownerId(ownerId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return spaceRepository.save(space);
    }

    public List<Space> getAllSpaces() {
        return spaceRepository.findAll();
    }

    public Space getSpaceById(Long id) {
        return spaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 Space가 없음. id=" + id));
        // optional안에서 Space를 찾아라. 있으면 반환, 없으면 에러.
    }

    public void deleteSpace(Long id) {
        spaceRepository.deleteById(id);
    }
}
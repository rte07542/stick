package com.stick.app.service;

import com.stick.app.domain.space.Space;
import com.stick.app.domain.space.SpaceMember;
import com.stick.app.domain.space.SpaceRole;
import com.stick.app.repository.space.SpaceMemberRepository;
import com.stick.app.repository.space.SpaceRepository;
import com.stick.user.domain.User;
import com.stick.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final UserService userService;
    private final SpaceMemberService spaceMemberService;
    private final SpaceMemberRepository spaceMemberRepository;

    public Space createSpace(String name, Long ownerId, String description) {
        User creator = userService.getUserById(ownerId);

        Space space = Space.builder()
                .name(name)
                .description(description)
                .build();

        Space savedSpace = spaceRepository.save(space);

        spaceMemberService.addMember(savedSpace.getId(), creator.getId(), SpaceRole.OWNER);

        return spaceRepository.save(space);
    }
    /*  이 함수의 역할 - 컨트롤에서 name, 작성자, 설명을 받아서 작동함
        Space 객체 생성 - DB에 저장 - 저장된 객체 반환
        public Space createSpace(String name, Long ownerId, String description) : controller에서 3가지 정보를 받아온다.
        Space space : space 객체 하나 생성
        return spaceRepository.save(space); :
    */

    public List<Space> getAllSpaces() {
        return spaceRepository.findAll();
    }
    //space 테이블 내용 전체 불러오기. 컨트롤이 요청하면 레지스토리한테서 캐내옴

    public Space getSpaceById(Long id) {
        return spaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 Space가 없음. id=" + id));
    }
    // optional안에서 Space를 찾아라. 있으면 반환, 없으면 에러.
    // optional이 뭘까? "값이 있을수도 없을수도 있음"을 안전하게 다루는 상자

    @Transactional
    public void deleteSpace(Long id) {
        Space space = spaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 Space가 없음. id=" + id));

        spaceRepository.delete(space);
    }
    //전달 받은 id의 Space를 db에서 지우는 함수

    public List<Space> getSpacesByUserId(Long userId) {
        List<SpaceMember> members = spaceMemberRepository.findByUserId (userId);
        return members.stream()
                .map(SpaceMember::getSpace)
                .toList();
    }
}
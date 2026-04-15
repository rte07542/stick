package com.stick.app.controller.space;

import com.stick.app.domain.space.Space;
import com.stick.app.service.space.SpaceInviteService;
import com.stick.app.service.space.SpaceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/spaces")
public class SpaceInviteController {
    private final SpaceInviteService spaceInviteService;
    private final SpaceService spaceService;

    //초대코드 생성
    @PostMapping("/{spaceId}/invite")
    public String generateInviteCode(@PathVariable Long spaceId, HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        return spaceInviteService.createInvite(spaceId, userId);
    }

    // 초대코드로 참여
    @PostMapping("/join")
    public Space joinByInviteCode(@RequestBody Map<String, String> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String code = body.get("inviteCode");
        Long spaceId = spaceInviteService.joinByCode(code, userId);
        return spaceService.getSpaceById(spaceId);
    }

}

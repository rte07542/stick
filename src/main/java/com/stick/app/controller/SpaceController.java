package com.stick.app.controller;

import com.stick.app.domain.space.Space;
import com.stick.app.service.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/spaces")
public class SpaceController {

    private final SpaceService spaceService;

    @PostMapping
    public Space createSpace(@RequestParam String name,
                             @RequestParam Long ownerId,
                             @RequestParam(required = false) String description) {
        return spaceService.createSpace(name, ownerId, description);
    }

    @GetMapping
    public List<Space> getAllSpaces() {
        return spaceService.getAllSpaces();
    }

    @GetMapping("/{id}")
    public Space getSpaceById(@PathVariable Long id) {
        return spaceService.getSpaceById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSpace(@PathVariable Long id) {
        spaceService.deleteSpace(id);
    }
}
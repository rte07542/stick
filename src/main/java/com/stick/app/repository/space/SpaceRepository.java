package com.stick.app.repository.space;

import com.stick.app.domain.space.Space;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpaceRepository extends JpaRepository<Space, Long> {
}

//extends JpaRepository : JpaRepository 기능을 전부 상속 받는다.
/* JpRepository가 가지고 있는 기능
 save()
 findAll()
 findById()
 deleteById()
 count()
 existsById()
 ... 등등
*/
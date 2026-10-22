package com.atlasskills.repository;

import com.atlasskills.model.entity.HardSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HardSkillRepository extends JpaRepository<HardSkill, Long> {
    List<HardSkill> findByProfileId(Long profileId);
    Optional<HardSkill> findByIdAndProfileId(Long id, Long profileId);
}

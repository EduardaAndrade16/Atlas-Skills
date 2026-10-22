package com.atlasskills.repository;

import com.atlasskills.model.entity.SoftSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoftSkillRepository extends JpaRepository<SoftSkill, Long> {
    List<SoftSkill> findByProfileId(Long profileId);
    Optional<SoftSkill> findByIdAndProfileId(Long id, Long profileId);
}

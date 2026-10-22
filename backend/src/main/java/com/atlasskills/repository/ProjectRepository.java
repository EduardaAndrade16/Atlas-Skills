package com.atlasskills.repository;

import com.atlasskills.model.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByProfileId(Long profileId);
    Optional<Project> findByIdAndProfileId(Long id, Long profileId);
}

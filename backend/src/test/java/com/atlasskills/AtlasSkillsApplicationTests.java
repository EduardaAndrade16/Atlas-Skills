package com.atlasskills;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AtlasSkillsApplicationTests {

    @Test
    void contextLoads() {
        // Confirms that the Spring application context starts up correctly with H2 database
    }
}

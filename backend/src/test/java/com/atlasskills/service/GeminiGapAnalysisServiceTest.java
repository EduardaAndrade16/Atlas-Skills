package com.atlasskills.service;

import com.atlasskills.exception.AiServiceException;
import com.atlasskills.model.dto.GapAnalysisResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;

class GeminiGapAnalysisServiceTest {

    private static final String API_KEY = "unit-test-key";

    private CareerProfileSnapshotService snapshotService;
    private MockRestServiceServer server;
    private GeminiGapAnalysisService analysisService;

    @BeforeEach
    void setUp() {
        snapshotService = new CareerProfileSnapshotService(null, null, null, null, null) {
            @Override
            public CareerProfileSnapshot getSnapshot(Long userId) {
                assertThat(userId).isEqualTo(7L);
                return new CareerProfileSnapshot(
                        "Engenharia de software",
                        "Tech Lead",
                        List.of(new HardSkillInput("Java", "AVANCADO", 4)),
                        List.of("Comunicação (INTERMEDIARIO)"),
                        List.of("Certificação de exemplo - Emissor"),
                        List.of(new ProjectInput(List.of("Spring Boot"))));
            }
        };
        RestClient.Builder restClientBuilder = RestClient.builder();
        server = MockRestServiceServer.bindTo(restClientBuilder).build();
        analysisService = new GeminiGapAnalysisService(
                snapshotService,
                restClientBuilder.build(),
                new ObjectMapper());
        ReflectionTestUtils.setField(analysisService, "apiKey", API_KEY);
        ReflectionTestUtils.setField(analysisService, "model", "gemini-3.8-flash");
    }

    @Test
    void shouldReturnValidatedGapAnalysisFromGemini() throws Exception {
        String resultJson = """
                {"readinessScore":82,"summary":"Boa base técnica.",
                 "identifiedGaps":[{"skill":"Liderança","currentLevel":"Intermediário",
                 "targetLevel":"Avançado","impact":"Necessária para o objetivo."}],
                 "recommendedTracks":[{"title":"Liderança técnica",
                 "description":"Prática de liderança.","estimatedHours":24,
                 "steps":["Mentorar uma pessoa","Conduzir uma revisão técnica"]}]}
                """;
        String geminiResponse = """
                {"candidates":[{"content":{"parts":[{"text":%s}]}}]}
                """.formatted(new ObjectMapper().writeValueAsString(resultJson));
        server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/"
                        + "gemini-3.8-flash:generateContent"))
                .andExpect(method(POST))
                .andExpect(header("x-goog-api-key", API_KEY))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(geminiResponse, MediaType.APPLICATION_JSON));

        GapAnalysisResponse result = analysisService.analyze(7L);

        assertThat(result.readinessScore()).isEqualTo(82);
        assertThat(result.identifiedGaps()).hasSize(1);
        assertThat(result.recommendedTracks().get(0).steps()).hasSize(2);
        server.verify();
    }

    @Test
    void shouldReportTemporaryGeminiOverload() {
        server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/"
                        + "gemini-3.8-flash:generateContent"))
                .andExpect(method(POST))
                .andExpect(header("x-goog-api-key", API_KEY))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        assertThatThrownBy(() -> analysisService.analyze(7L))
                .isInstanceOf(AiServiceException.class)
                .satisfies(exception -> {
                    AiServiceException aiException = (AiServiceException) exception;
                    assertThat(aiException.getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                    assertThat(aiException.getMessage()).contains("temporariamente sobrecarregado");
                });
        server.verify();
    }

    @Test
    void shouldRejectInvalidGeminiResponse() {
        server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/"
                        + "gemini-3.8-flash:generateContent"))
                .andExpect(method(POST))
                .andExpect(header("x-goog-api-key", API_KEY))
                .andRespond(withSuccess("""
                        {"candidates":[{"content":{"parts":[{"text":"not json"}]}}]}
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> analysisService.analyze(7L))
                .isInstanceOf(AiServiceException.class)
                .satisfies(exception -> assertThat(((AiServiceException) exception).getStatus())
                        .isEqualTo(HttpStatus.BAD_GATEWAY));
        server.verify();
    }

    @Test
    void shouldFailClearlyWhenApiKeyIsNotConfigured() {
        ReflectionTestUtils.setField(analysisService, "apiKey", " ");

        assertThatThrownBy(() -> analysisService.analyze(7L))
                .isInstanceOf(AiServiceException.class)
                .satisfies(exception -> assertThat(((AiServiceException) exception).getStatus())
                        .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
        server.verify();
    }
}

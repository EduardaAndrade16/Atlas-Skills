package com.atlasskills.exception;

import com.atlasskills.model.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    @Test
    void shouldHandleObjectLevelValidationErrorsWithoutReturningInternalServerError() throws Exception {
        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(new FieldError("request", "name", "Nome obrigatório."));
        bindingResult.addError(new ObjectError("request", "A solicitação não é válida."));
        MethodParameter parameter = new MethodParameter(
                ValidationFixture.class.getMethod("endpoint", Object.class), 0);
        MethodArgumentNotValidException exception =
                new MethodArgumentNotValidException(parameter, bindingResult);

        var response = exceptionHandler.handleValidationExceptions(exception, request());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getFieldErrors())
                .containsExactly("name: Nome obrigatório.", "A solicitação não é válida.");
    }

    @Test
    void shouldPreserveTheGenericErrorResponseForUnexpectedExceptions() {
        HttpServletRequest request = request();

        var response = exceptionHandler.handleGenericException(
                new IllegalStateException("internal detail"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        assertThat(response.getBody().getMessage())
                .doesNotContain("internal detail");
    }

    private MockHttpServletRequest request() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        request.setRequestURI("/api/v1/test");
        return request;
    }

    private static class ValidationFixture {
        public void endpoint(Object request) {}
    }
}

package com.alertasegura.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
//Este es lo que devuelve el backend después de un login/registro exitoso
//el JWT y algo de info del usuario.
public class AuthResponseDTO {

    private String token;
    private String email;
    private String nombre;
    private String rol;
}
# Sesión guiada y edición contextual

1. El chat aparece arriba de cada sección estructurada y conoce el contexto actual.
2. La persona puede escribir libremente y proponer un registro para confirmar.
3. La persona puede pedir preguntas de seguimiento orientadas a resultados, acciones y aprendizajes.
4. Los registros se guardan por `profileId` y sección.
5. La siguiente pregunta se deriva del número de respuestas mediante `nextPrompt`; al finalizar, se ofrece revisar el perfil.
6. Las respuestas se guardan en el perfil al continuar. Una sesión nueva limpia esas respuestas solo después de confirmación.
7. Si hay un token y endpoint configurados, continuar envía la conversación al proveedor; la interfaz lo informa junto al campo de respuesta.

El asistente debe reflejar, preguntar y pedir evidencia; no debe inventar logros ni completar información no confirmada. Sus respuestas son temporales y no se guardan como hechos.

# Claude Code Custom Commands

Este directorio contiene comandos personalizados (slash commands) para Claude Code que funcionan como agentes especializados.

## Comandos Disponibles

### `/implement-jira-story <STORY_KEY>`

Agente autónomo para implementar historias de usuario desde Jira.

**Uso:**
```
/implement-jira-story SCRUM-35
```

**Lo que hace:**
1. ✅ Descarga la historia desde Jira
2. ✅ Analiza requerimientos y criterios de aceptación
3. ✅ Crea un plan de implementación detallado
4. ✅ Implementa siguiendo Clean Architecture
5. ✅ Crea tests comprehensivos
6. ✅ Valida con build y testing
7. ✅ Crea commit con mensaje descriptivo

**Ventajas:**
- Implementación consistente siguiendo las convenciones del proyecto
- Cobertura de tests garantizada
- Documentación automática en commits
- Validación de arquitectura limpia
- Integración completa con Jira

**Flujo típico:**
```bash
# 1. Asegúrate de estar en la rama correcta
git checkout -b feature/SCRUM-35

# 2. En Claude Code, ejecuta:
/implement-jira-story SCRUM-35

# 3. El agente trabajará de forma autónoma
# Podrás ver el progreso en el todo list

# 4. Revisa los cambios cuando termine
git log -1 --stat

# 5. Haz push de la rama
git push -u origin feature/SCRUM-35
```

## Configuración de Jira

Asegúrate de tener configurado el MCP server de Atlassian en tu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-atlassian"],
      "env": {
        "ATLASSIAN_INSTANCE_URL": "https://tu-sitio.atlassian.net",
        "ATLASSIAN_EMAIL": "tu-email@example.com",
        "ATLASSIAN_API_TOKEN": "tu-token-api"
      }
    }
  }
}
```

## Crear Nuevos Comandos

Para crear un nuevo comando personalizado:

1. Crea un archivo `.md` en este directorio
2. El nombre del archivo será el comando (ej: `mi-comando.md` → `/mi-comando`)
3. Usa `{{PARAMETER}}` para parámetros
4. Incluye instrucciones detalladas para el agente

**Ejemplo:**
```markdown
# Mi Comando Personalizado

Descripción de lo que hace el comando.

## Parámetros
- {{PARAM1}}: descripción
- {{PARAM2}}: descripción

## Instrucciones
[Instrucciones detalladas para Claude Code]
```

## Tips

- Los comandos pueden usar todas las herramientas disponibles (Bash, Read, Write, Edit, etc.)
- Pueden invocar otros comandos o agentes
- El TodoWrite tool es muy útil para tracking de progreso
- Siempre valida antes de hacer commits

## Comandos Futuros

Ideas para próximos comandos:
- `/create-component <name>`: Scaffold completo de componente con tests
- `/refactor-component <path>`: Refactorización automática siguiendo best practices
- `/generate-tests <file>`: Generar tests para archivo existente
- `/update-docs`: Actualizar documentación basada en cambios recientes
- `/review-pr <number>`: Revisar PR automáticamente

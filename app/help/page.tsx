/**
 * Help Page
 *
 * Comprehensive guide explaining how to use the application.
 * Includes sections on calendar configuration, viewing, statistics, and charts.
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/presentation/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/presentation/components/ui/accordion";
import { Button } from "@/src/presentation/components/ui/button";
import Link from "next/link";
import {
  CalendarIcon,
  Settings,
  BarChart3,
  HelpCircle,
  Home,
  ArrowRight,
  CheckCircle2,
  Clock,
  PieChart,
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background flex-1 mx-auto p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Ayuda</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guía completa para usar el Generador de Calendario Laboral por
            Ciclos
          </p>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Inicio Rápido
            </CardTitle>
            <CardDescription>Comienza en 3 simples pasos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    Configura tu calendario
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ve a la página principal y completa el asistente de
                    configuración con tus datos laborales.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    Visualiza tu calendario
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Haz clic en &ldquo;Ver Calendario&rdquo; para ver tu
                    calendario anual completo con todos tus días laborables,
                    descansos y vacaciones.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    Analiza tus estadísticas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Revisa las estadísticas y gráficos para entender tu
                    distribución laboral anual.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/" className="block">
              <Button className="w-full mt-4">
                <Home className="h-4 w-4 mr-2" />
                Ir a la Página Principal
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Detailed Help Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Guía Detallada</CardTitle>
            <CardDescription>
              Explicaciones paso a paso de cada funcionalidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {/* Section 1: Calendar Configuration */}
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <span className="font-semibold">
                      Configuración del Calendario
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Año</h4>
                    <p className="text-sm text-muted-foreground">
                      Selecciona el año para el cual deseas generar el
                      calendario. Por defecto, se muestra el año actual.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Inicio de Contrato</h4>
                    <p className="text-sm text-muted-foreground">
                      Indica si empezaste a trabajar este año o ya trabajabas
                      antes:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>
                        <strong>Empecé este año:</strong> Selecciona la fecha de
                        inicio. Los días anteriores aparecerán como &ldquo;No
                        Contratado&rdquo;.
                      </li>
                      <li>
                        <strong>Ya trabajaba antes:</strong> Si usas ciclos por
                        partes, especifica en qué parte y día del ciclo estabas
                        el 1 de enero.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Ciclo Laboral</h4>
                    <p className="text-sm text-muted-foreground">
                      Define tu patrón de trabajo:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-4">
                      <li>
                        <strong>Ciclo Semanal:</strong> Selecciona qué días de
                        la semana trabajas. Por ejemplo, de lunes a viernes.
                      </li>
                      <li>
                        <strong>Ciclo por Partes:</strong> Define secuencias de
                        días de trabajo y descanso. Por ejemplo: 6 días
                        trabajas, 3 descansas, 6 trabajas, 2 descansas. Puedes
                        usar plantillas predefinidas o crear tu propio ciclo
                        personalizado.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Vacaciones</h4>
                    <p className="text-sm text-muted-foreground">
                      Agrega todos tus períodos de vacaciones del año. Puedes
                      añadir múltiples períodos con descripciones opcionales
                      (ej: &ldquo;Verano&rdquo;, &ldquo;Navidad&rdquo;).
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Festivos</h4>
                    <p className="text-sm text-muted-foreground">
                      Puedes importar festivos automáticamente desde el BOE o
                      agregarlos manualmente. Marca si trabajaste en algún
                      festivo (estos contarán como días trabajados con horas
                      especiales).
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Horas de Trabajo</h4>
                    <p className="text-sm text-muted-foreground">
                      Define cuántas horas trabajas por día según el tipo de
                      día:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>Días laborables (lunes a viernes)</li>
                      <li>Sábados</li>
                      <li>Domingos</li>
                      <li>Festivos trabajados</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      También especifica las horas anuales de tu convenio para
                      calcular el balance de horas.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 2: Calendar View */}
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span className="font-semibold">Vista del Calendario</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    El calendario muestra los 12 meses del año en una vista de
                    cuadrícula. Cada día tiene un color que indica su estado:
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded" />
                      <div>
                        <p className="text-sm font-semibold">Verde - Trabajo</p>
                        <p className="text-xs text-muted-foreground">
                          Días que debes trabajar según tu ciclo
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-500 rounded" />
                      <div>
                        <p className="text-sm font-semibold">Gris - Descanso</p>
                        <p className="text-xs text-muted-foreground">
                          Días de descanso según tu ciclo laboral
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500 rounded" />
                      <div>
                        <p className="text-sm font-semibold">
                          Ámbar - Vacaciones
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Períodos que configuraste como vacaciones
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded" />
                      <div>
                        <p className="text-sm font-semibold">Rojo - Festivo</p>
                        <p className="text-xs text-muted-foreground">
                          Festivos oficiales que no trabajaste
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-500 rounded" />
                      <div>
                        <p className="text-sm font-semibold">
                          Violeta - Festivo Trabajado
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Festivos en los que sí trabajaste
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-400 rounded" />
                      <div>
                        <p className="text-sm font-semibold">
                          Gris Claro - No Contratado
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Días antes de tu fecha de inicio de contrato
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg mt-4">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Tip: Detalles del Día
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en cualquier día del calendario para ver
                      información detallada: fecha completa, estado, horas
                      trabajadas y una explicación de por qué tiene ese estado.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 3: Statistics */}
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-semibold">Panel de Estadísticas</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    El panel de estadísticas te ofrece un análisis detallado de
                    tu calendario anual:
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Distribución de Días</h4>
                    <p className="text-sm text-muted-foreground">
                      Muestra el conteo de días por cada estado, con barras de
                      progreso y porcentajes calculados sobre los días efectivos
                      (excluyendo días no contratados).
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Balance de Horas
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Si configuraste las horas de convenio, verás:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>
                        <strong>Horas trabajadas:</strong> Total de horas que
                        trabajarás en el año
                      </li>
                      <li>
                        <strong>Horas de convenio:</strong> Horas anuales según
                        tu contrato
                      </li>
                      <li>
                        <strong>Saldo:</strong> Diferencia entre lo trabajado y
                        lo requerido (positivo = horas extra, negativo = horas
                        pendientes)
                      </li>
                      <li>
                        <strong>Desglose por tipo de día:</strong> Horas en días
                        laborables, sábados, domingos y festivos
                      </li>
                      <li>
                        <strong>Promedios:</strong> Horas promedio por día
                        trabajado y por semana
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Distribución Semanal</h4>
                    <p className="text-sm text-muted-foreground">
                      Muestra cuántos días trabajas cada día de la semana (lunes
                      a domingo) con insights automáticos sobre tu patrón de
                      trabajo.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Información Adicional</h4>
                    <p className="text-sm text-muted-foreground">
                      Incluye totales de días laborables, no laborables, ratio
                      trabajo/descanso y si el año es bisiesto.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 4: Charts */}
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    <span className="font-semibold">Gráficos Interactivos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Los gráficos visualizan tus estadísticas de forma
                    interactiva. Puedes alternar entre tres tipos:
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-semibold">
                      1. Distribución de Días (Gráfico Circular)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Muestra la proporción de días por estado con los mismos
                      colores del calendario. Pasa el cursor sobre cada sección
                      para ver detalles exactos.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">
                      2. Días por Semana (Gráfico de Barras)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Visualiza cuántos días trabajas cada día de la semana. El
                      día más trabajado aparece en verde y el menos trabajado en
                      naranja.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">
                      3. Horas por Mes (Gráfico Combinado)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Muestra las horas trabajadas cada mes. Puedes cambiar
                      entre vista de barras, línea o combinada. Al pasar el
                      cursor verás las horas exactas, días trabajados y promedio
                      de horas por día.
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg mt-4">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Tip: Interactividad
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Todos los gráficos son interactivos. Pasa el cursor sobre
                      cualquier elemento para ver información detallada en un
                      tooltip.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 5: Tips & Best Practices */}
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">
                      Consejos y Buenas Prácticas
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Guarda tu configuración:</strong> Tus datos se
                        guardan automáticamente en tu navegador. Puedes volver a
                        editar el calendario cuando quieras desde la página
                        principal.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Verifica los festivos:</strong> Revisa que los
                        festivos importados correspondan a tu localidad. Puedes
                        editar o eliminar festivos que no apliquen.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Define horas realistas:</strong> Configura las
                        horas de trabajo que realmente cumples para obtener un
                        balance preciso.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Usa las plantillas:</strong> Si usas ciclos
                        comunes (6-3, 7-7, etc.), las plantillas predefinidas te
                        ahorrarán tiempo.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Revisa las estadísticas:</strong> El panel de
                        estadísticas te ayudará a entender mejor tu distribución
                        laboral y planificar mejor tu año.
                      </span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <Card className="bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <h3 className="text-xl font-semibold text-center">
              ¿Listo para crear tu calendario?
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Comienza ahora y visualiza tu año laboral completo en minutos
            </p>
            <Link href="/">
              <Button size="lg">
                <Home className="h-4 w-4 mr-2" />
                Ir a Configuración
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

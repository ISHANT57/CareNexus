# PowerShell script to reconstruct openapi.yaml with new paths and schemas in correct positions
$file = "e:\Caremesh-Platform\lib\api-spec\openapi.yaml"
$lines = Get-Content $file -Encoding UTF8

# Split: lines 0..1897 = original paths section (includes trailing blank line)
# lines 1898..3115 = original components section (components: through ConsultationList)
$pathsSection = $lines[0..1897]
$componentsSection = $lines[1898..3115]

# New paths to insert before components:
$newPaths = @'

  # ── Outcomes ───────────────────────────────────────────────────────────────
  /outcomes:
    get:
      operationId: listOutcomes
      tags: [outcomes]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: limit
          in: query
          schema: { type: integer }
        - name: patientId
          in: query
          schema: { type: string }
        - name: programId
          in: query
          schema: { type: string }
        - name: outcomeMetricId
          in: query
          schema: { type: string }
      responses:
        "200":
          description: List of outcomes
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PatientOutcomeList"
    post:
      operationId: createOutcome
      tags: [outcomes]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PatientOutcomeInput"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PatientOutcome"

  /outcomes/{id}:
    get:
      operationId: getOutcome
      tags: [outcomes]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PatientOutcome"
    patch:
      operationId: updateOutcome
      tags: [outcomes]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PatientOutcomeUpdate"
      responses:
        "200":
          description: Updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PatientOutcome"
    delete:
      operationId: deleteOutcome
      tags: [outcomes]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "204":
          description: Deleted

  # ── Outcome Metrics ────────────────────────────────────────────────────────
  /outcome-metrics:
    get:
      operationId: listOutcomeMetrics
      tags: [outcomeMetrics]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: limit
          in: query
          schema: { type: integer }
        - name: inactive
          in: query
          schema: { type: boolean }
      responses:
        "200":
          description: List of outcome metrics
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OutcomeMetricList"
    post:
      operationId: createOutcomeMetric
      tags: [outcomeMetrics]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/OutcomeMetricInput"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OutcomeMetric"

  /outcome-metrics/{id}:
    get:
      operationId: getOutcomeMetric
      tags: [outcomeMetrics]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OutcomeMetric"
    patch:
      operationId: updateOutcomeMetric
      tags: [outcomeMetrics]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/OutcomeMetricUpdate"
      responses:
        "200":
          description: Updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OutcomeMetric"
    delete:
      operationId: deleteOutcomeMetric
      tags: [outcomeMetrics]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "204":
          description: Deactivated

  # ── Tasks ──────────────────────────────────────────────────────────────────
  /tasks:
    get:
      operationId: listTasks
      tags: [tasks]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: limit
          in: query
          schema: { type: integer }
        - name: patientId
          in: query
          schema: { type: string }
        - name: assignedTo
          in: query
          schema: { type: string }
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, IN_PROGRESS, COMPLETED, OVERDUE]
        - name: overdue
          in: query
          schema: { type: boolean }
      responses:
        "200":
          description: List of care tasks
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CareTaskList"
    post:
      operationId: createTask
      tags: [tasks]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CareTaskInput"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CareTask"

  /tasks/{id}:
    get:
      operationId: getTask
      tags: [tasks]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CareTask"
    patch:
      operationId: updateTask
      tags: [tasks]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CareTaskUpdate"
      responses:
        "200":
          description: Updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CareTask"
    delete:
      operationId: deleteTask
      tags: [tasks]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "204":
          description: Deleted

  /tasks/{id}/complete:
    patch:
      operationId: completeTask
      tags: [tasks]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Completed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CareTask"

  /tasks/{id}/reopen:
    patch:
      operationId: reopenTask
      tags: [tasks]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Reopened
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CareTask"

  # ── Risk Scores ────────────────────────────────────────────────────────────
  /risk-scores:
    get:
      operationId: listRiskScores
      tags: [riskScores]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: limit
          in: query
          schema: { type: integer }
        - name: riskLevel
          in: query
          schema:
            type: string
            enum: [LOW, MEDIUM, HIGH, CRITICAL]
      responses:
        "200":
          description: Patients with risk scores
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PatientRiskScoreList"

  /risk-scores/recalculate-all:
    post:
      operationId: recalculateAllRiskScores
      tags: [riskScores]
      security:
        - bearerAuth: []
      responses:
        "200":
          description: Bulk recalculation result
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BulkRecalculateResult"

  /risk-scores/{patientId}:
    get:
      operationId: getPatientRiskScore
      tags: [riskScores]
      security:
        - bearerAuth: []
      parameters:
        - name: patientId
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Risk score details with factors
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PatientRiskScoreDetail"

  /risk-scores/{patientId}/calculate:
    post:
      operationId: calculatePatientRiskScore
      tags: [riskScores]
      security:
        - bearerAuth: []
      parameters:
        - name: patientId
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Recalculated risk score
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PatientRiskScore"
'@

# New schemas to append inside components.schemas:
$newSchemas = @'

    # ── Outcome Metric Schemas ─────────────────────────────────────────────
    OutcomeMetric:
      type: object
      required: [id, tenantId, code, name, category, unit, isActive, createdAt, updatedAt]
      properties:
        id: { type: string }
        tenantId: { type: string }
        code: { type: string }
        name: { type: string }
        category: { type: string }
        unit: { type: string }
        description:
          type: string
          nullable: true
        isActive: { type: boolean }
        createdAt: { type: string, format: date-time }
        updatedAt: { type: string, format: date-time }

    OutcomeMetricList:
      type: object
      required: [data, meta]
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/OutcomeMetric"
        meta:
          $ref: "#/components/schemas/Meta"

    OutcomeMetricInput:
      type: object
      required: [code, name, category, unit]
      properties:
        code: { type: string }
        name: { type: string }
        category: { type: string }
        unit: { type: string }
        description: { type: string }
        isActive: { type: boolean }

    OutcomeMetricUpdate:
      type: object
      properties:
        code: { type: string }
        name: { type: string }
        category: { type: string }
        unit: { type: string }
        description: { type: string }
        isActive: { type: boolean }

    # ── Patient Outcome Schemas ────────────────────────────────────────────
    PatientOutcome:
      type: object
      required: [id, tenantId, patientId, programId, outcomeMetricId, baselineValue, currentValue, targetValue, measuredAt, createdAt, updatedAt]
      properties:
        id: { type: string }
        tenantId: { type: string }
        patientId: { type: string }
        programId: { type: string }
        outcomeMetricId: { type: string }
        doctorId:
          type: string
          nullable: true
        baselineValue: { type: number }
        currentValue: { type: number }
        targetValue: { type: number }
        improvementPct: { type: number }
        progressPct: { type: number }
        targetAchieved: { type: boolean }
        unit: { type: string }
        notes:
          type: string
          nullable: true
        measuredAt: { type: string, format: date-time }
        createdAt: { type: string, format: date-time }
        updatedAt: { type: string, format: date-time }
        patient:
          type: object
          nullable: true
          properties:
            id: { type: string }
            firstName: { type: string }
            lastName: { type: string }
            nhsNumber: { type: string, nullable: true }
        program:
          type: object
          nullable: true
          properties:
            id: { type: string }
            name: { type: string }
        doctor:
          type: object
          nullable: true
          properties:
            id: { type: string }
            firstName: { type: string }
            lastName: { type: string }
        outcomeMetric:
          type: object
          nullable: true
          properties:
            id: { type: string }
            name: { type: string }
            code: { type: string }
            unit: { type: string }
            category: { type: string }

    PatientOutcomeList:
      type: object
      required: [data, meta]
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/PatientOutcome"
        meta:
          $ref: "#/components/schemas/Meta"

    PatientOutcomeInput:
      type: object
      required: [patientId, programId, outcomeMetricId, baselineValue, currentValue, targetValue]
      properties:
        patientId: { type: string }
        programId: { type: string }
        outcomeMetricId: { type: string }
        doctorId: { type: string }
        baselineValue: { type: number }
        currentValue: { type: number }
        targetValue: { type: number }
        measuredAt: { type: string, format: date-time }
        notes: { type: string }

    PatientOutcomeUpdate:
      type: object
      properties:
        outcomeMetricId: { type: string }
        baselineValue: { type: number }
        currentValue: { type: number }
        targetValue: { type: number }
        measuredAt: { type: string, format: date-time }
        notes: { type: string }

    # ── Care Task Schemas ──────────────────────────────────────────────────
    CareTask:
      type: object
      required: [id, tenantId, patientId, assignedBy, assignedTo, title, priority, status, dueDate, createdAt, updatedAt]
      properties:
        id: { type: string }
        tenantId: { type: string }
        patientId: { type: string }
        assignedBy: { type: string }
        assignedTo: { type: string }
        title: { type: string }
        description:
          type: string
          nullable: true
        priority:
          type: string
          enum: [LOW, MEDIUM, HIGH, CRITICAL]
        status:
          type: string
          enum: [PENDING, IN_PROGRESS, COMPLETED, OVERDUE]
        dueDate: { type: string, format: date-time }
        completedAt:
          type: string
          format: date-time
          nullable: true
        isOverdue: { type: boolean }
        deletedAt:
          type: string
          format: date-time
          nullable: true
        createdAt: { type: string, format: date-time }
        updatedAt: { type: string, format: date-time }
        patient:
          type: object
          nullable: true
          properties:
            id: { type: string }
            firstName: { type: string }
            lastName: { type: string }
            nhsNumber: { type: string, nullable: true }
        creator:
          type: object
          nullable: true
          properties:
            id: { type: string }
            firstName: { type: string }
            lastName: { type: string }
        assignee:
          type: object
          nullable: true
          properties:
            id: { type: string }
            firstName: { type: string }
            lastName: { type: string }

    CareTaskList:
      type: object
      required: [data, meta]
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/CareTask"
        meta:
          $ref: "#/components/schemas/Meta"

    CareTaskInput:
      type: object
      required: [patientId, assignedTo, title, dueDate]
      properties:
        patientId: { type: string }
        assignedTo: { type: string }
        title: { type: string }
        description: { type: string }
        priority:
          type: string
          enum: [LOW, MEDIUM, HIGH, CRITICAL]
          default: MEDIUM
        dueDate: { type: string, format: date-time }

    CareTaskUpdate:
      type: object
      properties:
        title: { type: string }
        description: { type: string }
        priority:
          type: string
          enum: [LOW, MEDIUM, HIGH, CRITICAL]
        status:
          type: string
          enum: [PENDING, IN_PROGRESS, COMPLETED, OVERDUE]
        dueDate: { type: string, format: date-time }
        assignedTo: { type: string }

    # ── Risk Score Schemas ─────────────────────────────────────────────────
    PatientRiskScore:
      type: object
      required: [id, firstName, lastName]
      properties:
        id: { type: string }
        firstName: { type: string }
        lastName: { type: string }
        nhsNumber:
          type: string
          nullable: true
        riskScore:
          type: number
          nullable: true
        riskLevel:
          type: string
          enum: [LOW, MEDIUM, HIGH, CRITICAL]
          nullable: true
        lastCalculatedAt:
          type: string
          format: date-time
          nullable: true
        clinic:
          type: object
          nullable: true
          properties:
            id: { type: string }
            name: { type: string }
        program:
          type: object
          nullable: true
          properties:
            id: { type: string }
            name: { type: string }

    RiskFactor:
      type: object
      properties:
        name: { type: string }
        weight: { type: number }
        value: { type: number }
        contribution: { type: number }

    PatientRiskScoreDetail:
      allOf:
        - $ref: "#/components/schemas/PatientRiskScore"
        - type: object
          properties:
            factors:
              type: array
              items:
                $ref: "#/components/schemas/RiskFactor"

    PatientRiskScoreList:
      type: object
      required: [data, meta]
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/PatientRiskScore"
        meta:
          $ref: "#/components/schemas/Meta"

    BulkRecalculateResult:
      type: object
      properties:
        ok: { type: boolean }
        processed: { type: integer }
        failed: { type: integer }
'@

# Reconstruct: paths (0..1897) + new paths + components (1898..3115) + new schemas
$newPathsLines = $newPaths -split "`n"
$newSchemasLines = $newSchemas -split "`n"

$output = $pathsSection + $newPathsLines + $componentsSection + $newSchemasLines

[System.IO.File]::WriteAllLines("e:\Caremesh-Platform\lib\api-spec\openapi.yaml", $output, [System.Text.UTF8Encoding]::new($false))

Write-Host "Done. New line count: $($output.Count)"

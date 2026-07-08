export const METRIC_NAMES = {
  HTTP_REQUEST_DURATION: 'xennic_http_request_duration_ms',
  HTTP_REQUEST_TOTAL: 'xennic_http_request_total',
  HTTP_REQUEST_ERRORS: 'xennic_http_request_errors',
  HTTP_REQUEST_SIZE: 'xennic_http_request_size_bytes',
  HTTP_RESPONSE_SIZE: 'xennic_http_response_size_bytes',

  DB_QUERY_DURATION: 'xennic_db_query_duration_ms',
  DB_QUERY_TOTAL: 'xennic_db_query_total',
  DB_CONNECTION_POOL: 'xennic_db_connection_pool_size',
  DB_ACTIVE_CONNECTIONS: 'xennic_db_active_connections',

  REDIS_OPERATION_DURATION: 'xennic_redis_operation_duration_ms',
  REDIS_OPERATION_TOTAL: 'xennic_redis_operation_total',
  REDIS_CONNECTED: 'xennic_redis_connected',

  RABBITMQ_PUBLISH_DURATION: 'xennic_rabbitmq_publish_duration_ms',
  RABBITMQ_CONSUME_DURATION: 'xennic_rabbitmq_consume_duration_ms',
  RABBITMQ_MESSAGES_TOTAL: 'xennic_rabbitmq_messages_total',
  RABBITMQ_CONNECTED: 'xennic_rabbitmq_connected',

  QDRANT_QUERY_DURATION: 'xennic_qdrant_query_duration_ms',
  QDRANT_QUERY_TOTAL: 'xennic_qdrant_query_total',

  MINIO_OPERATION_DURATION: 'xennic_minio_operation_duration_ms',
  MINIO_OPERATION_TOTAL: 'xennic_minio_operation_total',

  AI_PROVIDER_REQUEST_DURATION: 'xennic_ai_provider_request_duration_ms',
  AI_PROVIDER_REQUEST_TOTAL: 'xennic_ai_provider_request_total',
  AI_PROVIDER_ERRORS: 'xennic_ai_provider_errors',
  AI_PROVIDER_TOKENS: 'xennic_ai_provider_tokens_total',
  AI_PROVIDER_CIRCUIT_STATE: 'xennic_ai_provider_circuit_state',
  AI_PROVIDER_QUOTA_REMAINING: 'xennic_ai_provider_quota_remaining',

  WORKFLOW_EXECUTION_DURATION: 'xennic_workflow_execution_duration_ms',
  WORKFLOW_EXECUTION_TOTAL: 'xennic_workflow_execution_total',
  WORKFLOW_STEP_DURATION: 'xennic_workflow_step_duration_ms',

  QUEUE_JOB_DURATION: 'xennic_queue_job_duration_ms',
  QUEUE_JOB_TOTAL: 'xennic_queue_job_total',
  QUEUE_JOB_FAILURES: 'xennic_queue_job_failures',
  QUEUE_DEPTH: 'xennic_queue_depth',

  SLO_AVAILABILITY: 'xennic_slo_availability',
  SLO_LATENCY_P99: 'xennic_slo_latency_p99_ms',
  SLO_ERROR_RATE: 'xennic_slo_error_rate',
  SLO_AI_RESPONSE_TIME: 'xennic_slo_ai_response_time_ms',
  SLO_WORKFLOW_EXECUTION: 'xennic_slo_workflow_execution_time_ms',

  APP_MEMORY: 'xennic_app_memory_bytes',
  APP_CPU: 'xennic_app_cpu_seconds',
  APP_UP: 'xennic_app_up',
} as const;

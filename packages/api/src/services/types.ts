export type ServiceResponse<DataType, ErrorType = string> = {
  status: 'success'
  data: DataType
} | {
  status: 'error'
  error: ErrorType
  statusCode?: number
}

import convict, { Schema } from 'convict'

export interface IOpenAI {
  apiKey: string
  model: string
}

const openAISchema: Schema<IOpenAI> = {
  apiKey: {
    doc: 'OpenAI API key',
    format: String,
    default: '',
    env: 'OPENAI_API_KEY',
  },
  model: {
    doc: 'OpenAI model to use',
    format: String,
    default: 'gpt-4o-mini',
    env: 'OPENAI_MODEL',
  },
}

export const openAIConfig = convict(openAISchema)
  .validate({
    allowed: 'strict',
  })
  .getProperties()

import { err, errAsync, ok, Result, ResultAsync } from 'neverthrow'
import { OpenAI } from 'openai'
import { OpenAIError } from 'openai/error'
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
} from 'openai/resources/index'

import { openAIConfig } from '../../../config/features/openai.config'
import { createLoggerWithLabel } from '../../../config/logger'

import {
  ModelGetClientFailureError,
  ModelResponseFailureError,
} from './admin-form.errors'

const { apiKey, model } = openAIConfig

const logger = createLoggerWithLabel(module)

const getLlmClient = (): Result<OpenAI, OpenAIError> => {
  try {
    const client = new OpenAI({
      apiKey,
    })
    return ok(client)
  } catch (error) {
    logger.error({
      message: 'Error occurred when getting Llm client',
      meta: {
        action: 'getLlmClient',
      },
      error,
    })
    return err(new ModelGetClientFailureError())
  }
}

export enum Role {
  User = 'user',
  System = 'system',
}

export type Message = ChatCompletionMessageParam

/**
 * Sends prompt to the AI LLM and returns the response.
 * @param {Message[]} params.messages - An array of message objects to send to the AI.
 * @param {Object} [params.options] - Optional parameters for the chat completion.
 * @param {string} params.formId - The ID of the form associated with this request. Used for logging.
 * @returns {ResultAsync<string | null, ModelGetClientFailureError>} A Result containing the AI's response or null if no response, or an error if the request fails.
 */
export const sendPromptToModel = ({
  messages,
  options,
  formId,
}: {
  messages: Message[]
  options?: Omit<ChatCompletionCreateParamsNonStreaming, 'model' | 'messages'>
  formId: string
}): ResultAsync<
  string | null,
  ModelGetClientFailureError | ModelResponseFailureError
> => {
  const logMeta = {
    action: 'sendUserTextPrompt',
    formId,
  }
  const getLlmClientResult = getLlmClient()

  if (getLlmClientResult.isErr()) {
    logger.error({
      message: 'Failed to get Llm client',
      meta: logMeta,
      error: getLlmClientResult.error,
    })
    return errAsync(getLlmClientResult.error)
  }

  const llmClient = getLlmClientResult.value

  const chatCompletionPrompt: ChatCompletionCreateParamsNonStreaming = {
    messages,
    model,
    ...options,
  }

  return ResultAsync.fromPromise(
    llmClient.chat.completions.create(chatCompletionPrompt),
    (err) => {
      logger.error({
        message: 'Failed to generate model response',
        meta: logMeta,
        error: err,
      })
      return new ModelResponseFailureError()
    },
  ).map((response) => {
    const isLlmResponseMissing =
      !response.choices ||
      response.choices.length <= 0 ||
      !response.choices[0].message?.content

    if (isLlmResponseMissing) {
      return null
    }
    return response.choices[0].message?.content
  })
}

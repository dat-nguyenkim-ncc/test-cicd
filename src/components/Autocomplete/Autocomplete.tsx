import React, { useState } from 'react'
import Autosuggest from 'react-autosuggest'
import { Text, Box, Label } from 'theme-ui'
import { Palette, PaletteKeys } from '../../theme'
import { ChangeFieldEvent, ViewInterface } from '../../types'

export type AutocompleteOption = {
  id?: string
  external_investor_id?: string
  name: string
  type?: string
  source?: string
}

type AutocompleteProps = ViewInterface<{
  style?: any
  name: string
  value: string
  options: AutocompleteOption[]
  setOptions: any
  fetchRequested(name: string): void
  onChangeField(event: ChangeFieldEvent): void
  onBlurField(event: ChangeFieldEvent): void
  onSelect(suggestion: AutocompleteOption): void
  onEnter?(): void
  label?: string
  background?: PaletteKeys
}>

let timer: any

const Autocomplete = ({
  sx,
  style,
  name,
  value,
  options,
  setOptions,
  fetchRequested,
  onChangeField,
  onBlurField,
  onSelect,
  label,
  background,
}: AutocompleteProps) => {
  const [suggestionSelected, setSuggestionSelected] = useState<AutocompleteOption>()

  const onSuggestionsFetchRequested = (event: any) => {
    if (event.value !== value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        fetchRequested(event.value)
      }, 500)
    }
  }

  const onSuggestionsClearRequested = () => {
    // setOptions([])
  }

  const getSuggestionValue = (suggestion: any) => {
    return suggestion.name
  }
  const renderSuggestion = (suggestion: any) => {
    return <Text>{suggestion.name}</Text>
  }

  const onSuggestionSelected = (event: any, { suggestion }: any) => {
    onSelect(suggestion)
  }
  const onSuggestionHighlighted = ({ suggestion }: any) => {
    setSuggestionSelected(suggestion)
  }

  const inputProps = {
    placeholder: 'Name',
    value,
    name,
    onKeyDown: (e: any) => {
      if (e.key === 'Enter' && !suggestionSelected && !!options?.length) {
        onSelect(options[0])
      }
    },
    onChange: (event: ChangeFieldEvent) => {
      onChangeField(event)
    },
    onBlur: (event: ChangeFieldEvent) => {
      onBlurField(event)
    },
  }

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {label && <Label sx={{ color: Palette.text, flex: 1 }}>{label}</Label>}
      <Autosuggest
        suggestions={options}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        onSuggestionSelected={onSuggestionSelected}
        onSuggestionHighlighted={onSuggestionHighlighted}
      />
      <style>{`
        .react-autosuggest__container {
          position: relative;
        }

        .react-autosuggest__input {
          width: 100%;
          height: 42px;
          padding: 12px 24px;
          font-size: inherit;
          background-color: ${background ? Palette[background] : '#E2E2E2'};
          border: 0;
          border-radius: 10px;
        }

        .react-autosuggest__input--focused {
          outline: none;
        }

        .react-autosuggest__suggestions-container {
          display: none;
        }

        .react-autosuggest__suggestions-container--open {
          display: block;
          position: absolute;
          top: 45px;
          width: 100%;
          overflow-y: auto;
          max-height: ${style?.maxHeight || '300px'};
          border: 1px solid #aaa;
          background-color: #fff;
          font-size: 16px;
          border-radius: 4px;
          z-index: 2;
        }

        .react-autosuggest__suggestions-list {
          margin: 0;
          padding: 0;
          list-style-type: none;
        }

        .react-autosuggest__suggestion {
          cursor: pointer;
          padding: 10px 20px;
        }

        .react-autosuggest__suggestion--highlighted {
          background-color: #ddd;
        }
      `}</style>
    </Box>
  )
}

export default Autocomplete

import React, { Component } from 'react'
import OktaSignIn from '@okta/okta-signin-widget'
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css'

type Props = {
  baseUrl: string
  onSuccess: (res: any) => void
  onError: (res: any) => void
}

export default class OktaSignInWidget extends Component<Props> {
  public widget: any
  public el: React.RefObject<HTMLInputElement>

  constructor(props: Props) {
    super(props)
    this.el = React.createRef()
  }

  componentDidMount() {
    const el = this.el.current

    this.widget = new OktaSignIn({
      baseUrl: this.props.baseUrl,

      i18n: {
        en: {
          'primaryauth.title': 'Expand',
        },
      },
    })

    this.widget.renderEl({ el }, this.props.onSuccess, this.props.onError)
  }

  componentWillUnmount() {
    this.widget.remove()
  }

  render() {
    return <div ref={this.el} />
  }
}

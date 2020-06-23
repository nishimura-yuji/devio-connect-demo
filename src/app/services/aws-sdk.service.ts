import { Injectable } from '@angular/core';
import { ICredentials } from '@aws-amplify/core';
import Amplify, { Auth } from 'aws-amplify';
import { combineLatest, from, BehaviorSubject } from 'rxjs';
import jwt_decode from 'jwt-decode';
import AWS from 'aws-sdk';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import * as config from '../../../auth_config.json';

Amplify.configure({
  Auth: {
    identityPoolId: environment.AMPLIFY.identityPoolId,
    region: environment.REGION,
  },
});

@Injectable({
  providedIn: 'root'
})
export class AwsSdkService {
  dynamodb$: BehaviorSubject<AWS.DynamoDB> = new BehaviorSubject(null);
  constructor(private auth: AuthService) {
    this.loginCheck();
  }
  async loginCheck() {
    const credentialsData: ICredentials = await Auth.currentCredentials(); // Credentials取得
    console.log('### credntialsData ###', credentialsData);
    const { authenticated, ...info } = credentialsData;
    if (!authenticated) {
      this.signInFromAuth0Token(); // 未ログインのとき
    } else {
      this.initAwsSDK(credentialsData);
    }
    console.log({ authenticated, info });
  }

  private signInFromAuth0Token() {
    // auth0の必要な情報を取得し、cognitoからcredentialを取得する関数に渡す。
    combineLatest([
      this.auth.getUser$(),
      this.auth.getTokenSilently$(),
    ]).subscribe((result) => {
      const token = result[1];
      const { name, email } = result[0];
      const { exp } = jwt_decode(token);
      const domain = config.domain;
      this.federatedSignIn(domain, token, exp, name, email);
    });
  }

  private federatedSignIn(
    domain: string,
    idToken: string,
    exp: number,
    name: string,
    email: string
  ) {
    // cognito id_poolへ情報を渡しcredentialsを取得
    Auth.federatedSignIn(
      domain, // The Auth0 Domain,
      {
        token: idToken, // The id token from Auth0
        expires_at: exp * 1000, // the expiration timestamp
      },
      {
        // get from the Auth0
        name, // the user name
        email, // Optional, the email address
      }
    ).then((cred) => {
      console.log(cred);
    });
  }

  private initAwsSDK(credentialsData: ICredentials) {
    if (!credentialsData) {
      return;
    }
    this.dynamodb$.next(this.AwsSdkDynamoDB(credentialsData));
  }

  private AwsSdkDynamoDB(credentialsData: ICredentials) {
    return new AWS.DynamoDB({
      region: environment.REGION,
      credentials: Auth.essentialCredentials(credentialsData),
    });
  }
}

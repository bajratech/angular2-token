import { HttpClientModule, HttpRequest, HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  AngularTokenModule,
  AngularTokenService,
  SignInData,
  RegisterData,
  UpdatePasswordData,
  ResetPasswordData
} from 'angular-token';

describe('AngularTokenService', () => {

  // Init common test data
  const tokenType   = 'Bearer';
  const uid         = 'test@test.com';
  const accessToken = 'fJypB1ugmWHJfW6CELNfug';
  const client      = '5dayGs4hWTi4eKwSifu_mg';
  const expiry      = '1472108318';

  const emptyHeaders = {
    'content-Type': 'application/json'
  };

  const tokenHeaders = {
    'content-Type': 'application/json',
    'token-type': tokenType,
    'uid': uid,
    'access-token': accessToken,
    'client': client,
    'expiry': expiry
  };

  // SignIn test data
  const signInData: SignInData = {
    login: 'test@test.de',
    password: 'password'
  };

  const signInDataOutput = {
    email: 'test@test.de',
    password: 'password'
  };

  const signInDataCustomOutput = {
    username: 'test@test.de',
    password: 'password'
  };

  // Register test data
  const registerData: RegisterData = {
    login: 'test@test.de',
    password: 'password',
    passwordConfirmation: 'password'
  };

  const registerDataOutput = {
    email: 'test@test.de',
    password: 'password',
    password_confirmation: 'password'
  };

  const registerCustomDataOutput = {
    username: 'test@test.de',
    password: 'password',
    password_confirmation: 'password'
  };

  // Update password data
  const updatePasswordData: UpdatePasswordData = {
    password: 'newpassword',
    passwordConfirmation: 'newpassword',
    passwordCurrent: 'oldpassword'
  };

  const updatePasswordDataOutput = {
    current_password: 'oldpassword',
    password: 'newpassword',
    password_confirmation: 'newpassword'
  };

  // Reset password data
  const resetPasswordData: ResetPasswordData = {
    login: 'test@test.de',
  };

  const resetPasswordDataOutput = {
    email: 'test@test.de',
    redirect_url: 'http://localhost:9876/context.html'
  };

  const resetCustomPasswordDataOutput = {
    username: 'test@test.de',
    redirect_url: 'http://localhost:9876/context.html'
  };

  let service: AngularTokenService;
  let backend: HttpTestingController;

  function initService(serviceConfig) {
    // Inject HTTP and AngularTokenService
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
        AngularTokenModule.forRoot(serviceConfig)
      ],
      providers: [
        AngularTokenService
      ]
    });

    service = TestBed.get(AngularTokenService);
    backend = TestBed.get(HttpTestingController);
  }

  beforeEach(() => {
    // Fake Local Storage
    let store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string): String => {
      return store[key] || null;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): string => {
      return store[key] = <string>value;
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  afterEach(() => {
    backend.verify();
  });


  /**
   *
   * Test default configuration
   *
   */

  describe('default configuration', () => {
    beforeEach(() => {
      initService({});
    });

    it('signIn method should POST data', () => {

      service.signIn(signInData);

      const req = backend.expectOne({
        url: 'auth/sign_in',
        method: 'POST'
      });

      expect(req.request.body).toEqual(signInDataOutput);
    });

    it('signIn method should set local storage', () => {

      service.signIn(signInData).subscribe(data => console.log(data));

      const req = backend.expectOne({
        url: 'auth/sign_in',
        method: 'POST'
      }).flush(
        { login: 'test@email.com' },
        { headers: tokenHeaders }
      );

      expect(localStorage.getItem('accessToken')).toEqual(accessToken);
      expect(localStorage.getItem('client')).toEqual(client);
      expect(localStorage.getItem('expiry')).toEqual(expiry);
      expect(localStorage.getItem('tokenType')).toEqual(tokenType);
      expect(localStorage.getItem('uid')).toEqual(uid);
    });

    it('signOut method should DELETE and clear local storage', () => {

      service.signOut().subscribe();

      backend.expectOne({
        url: 'auth/sign_out',
        method: 'DELETE'
      });

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('client')).toBeNull();
      expect(localStorage.getItem('expiry')).toBeNull();
      expect(localStorage.getItem('tokenType')).toBeNull();
      expect(localStorage.getItem('uid')).toBeNull();
    });

    it('registerAccount should POST data', () => {

      service.registerAccount(registerData).subscribe();

      const req = backend.expectOne({
        url: 'auth',
        method: 'POST'
      });

      expect(req.request.body).toEqual(registerDataOutput);
    });

    it('validateToken should GET', () => {

      service.validateToken();

      const req = backend.expectOne({
        url: 'auth/validate_token',
        method: 'GET'
      });
    });

    it('validateToken should not call signOut when it returns status 401', () => {

      const signOutSpy = spyOn(service, 'signOut');

      service.validateToken().subscribe(() => {}, () => expect(signOutSpy).not.toHaveBeenCalled());

      const req = backend.expectOne({
        url: 'auth/validate_token',
        method: 'GET'
      });

      req.flush('',
        {
          status: 401,
          statusText: 'Not authorized'
        }
      );
    });

    it('updatePasswordPath should PUT', () => {

      service.updatePassword(updatePasswordData).subscribe();

      const req = backend.expectOne({
        url: 'auth',
        method: 'PUT'
      });

      expect(req.request.body).toEqual(updatePasswordDataOutput);
    });

    it('resetPasswordPath should POST', () => {

      service.resetPassword(resetPasswordData).subscribe();

      const req = backend.expectOne({
        url: 'auth/password',
        method: 'POST'
      });

      expect(req.request.body).toEqual(resetPasswordDataOutput);
    });

  });

  /**
   *
   * Testing custom configuration
   *
   */

  describe('custom configuration', () => {
    beforeEach(() => {
      initService({
        apiBase: 'https://localhost',
        apiPath: 'myapi',

        signInPath: 'myauth/mysignin',
        signOutPath: 'myauth/mysignout',
        registerAccountPath: 'myauth/myregister',
        deleteAccountPath: 'myauth/mydelete',
        validateTokenPath: 'myauth/myvalidate',
        updatePasswordPath: 'myauth/myupdate',
        resetPasswordPath: 'myauth/myreset',

        loginField: 'username'
      });
    });

    it('signIn method should POST data', () => {

      service.signIn(signInData);

      const req = backend.expectOne({
        url: 'https://localhost/myapi/myauth/mysignin',
        method: 'POST'
      });

      expect(req.request.body).toEqual(signInDataCustomOutput);
    });

    it('signOut method should DELETE', () => {

      service.signOut().subscribe();

      backend.expectOne({
        url: 'https://localhost/myapi/myauth/mysignout',
        method: 'DELETE'
      });
    });

    it('registerAccount should POST data', () => {

      service.registerAccount(registerData).subscribe();

      const req = backend.expectOne({
        url: 'https://localhost/myapi/myauth/myregister',
        method: 'POST'
      });

      expect(req.request.body).toEqual(registerCustomDataOutput);
    });

    it('validateToken should GET', () => {

      service.validateToken();

      backend.expectOne({
        url: 'https://localhost/myapi/myauth/myvalidate',
        method: 'GET'
      });
    });

    it('updatePasswordPath should PUT', () => {

      service.updatePassword(updatePasswordData).subscribe();

      const req = backend.expectOne({
        url: 'https://localhost/myapi/myauth/myupdate',
        method: 'PUT'
      });

      expect(req.request.body).toEqual(updatePasswordDataOutput);
    });

    it('resetPasswordPath should POST', () => {

      service.resetPassword(resetPasswordData).subscribe();

      const req = backend.expectOne({
        url: 'https://localhost/myapi/myauth/myreset',
        method: 'POST'
      });

      expect(req.request.body).toEqual(resetCustomPasswordDataOutput);
    });

  });

  describe('signoutValidate', () => {
    beforeEach(() => {
      initService({
        signOutFailedValidate: true
      });
    });

    it('validateToken should call signOut when it returns status 401', () => {

      const signOutSpy = spyOn(service, 'signOut');

      service.validateToken().subscribe(() => {}, () => expect(signOutSpy).toHaveBeenCalled() );

      const req = backend.expectOne({
        url: 'auth/validate_token',
        method: 'GET'
      });

      req.flush('',
        {
          status: 401,
          statusText: 'Not authorized'
        }
      );

    });
  });

});

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

  const signInDataOutput = JSON.stringify({
    email: 'test@test.de',
    password: 'password'
  });

  const signInDataCustomOutput = JSON.stringify({
    username: 'test@test.de',
    password: 'password'
  });

  // Register test data
  const registerData: RegisterData = {
    login: 'test@test.de',
    password: 'password',
    passwordConfirmation: 'password'
  };

  const registerDataOutput = JSON.stringify({
    login: 'test@test.de',
    password: 'password',
    password_confirmation: 'password',
    confirm_success_url: window.location.href
  });

  // Update password data
  const updatePasswordData: UpdatePasswordData = {
    password: 'newpassword',
    passwordConfirmation: 'newpassword',
    passwordCurrent: 'oldpassword'
  };

  const updatePasswordDataOutput = JSON.stringify({
    current_password: 'oldpassword',
    password: 'newpassword',
    password_confirmation: 'newpassword'
  });

  // Reset password data
  const resetPasswordData: ResetPasswordData = {
    login: 'test@test.de'
  }

  const resetPasswordDataOutput = JSON.stringify({
    email: 'test@test.de',
    redirect_url: window.location.href
  });

  const resetPasswordDataCustomOutput = JSON.stringify({
    username: 'test@test.de',
    redirect_url: window.location.href
  });

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

    it('signIn should POST data', () => {

      service.signIn(signInData);

      const req = backend.expectOne({
        url: 'auth/sign_in',
        method: 'POST'
      });

      expect(req.request.body).toEqual(signInDataOutput);
    });

    /*it('signIn method should set local storage', () => {

      service.signIn(signInData).subscribe(data => {
        expect(localStorage.getItem('accessToken')).toEqual(accessToken);
        expect(localStorage.getItem('client')).toEqual(client);
        expect(localStorage.getItem('expiry')).toEqual(expiry);
        expect(localStorage.getItem('tokenType')).toEqual(tokenType);
        expect(localStorage.getItem('uid')).toEqual(uid);
      });

      const req = backend.expectOne({
        url: 'auth/sign_in',
        method: 'POST'
      }).flush(
        { login: 'test@email.com' },
        { headers: tokenHeaders }
      );
    });*/

    it('signOut should DELETE', () => {

      service.signOut().subscribe();

      backend.expectOne({
        url: 'auth/sign_out',
        method: 'DELETE'
      });
    });


    it('signOut should clear local storage', () => {
      localStorage.setItem('token-type', tokenType);
      localStorage.setItem('uid', uid);
      localStorage.setItem('access-token', accessToken);
      localStorage.setItem('client', client);
      localStorage.setItem('expiry', expiry);

      service.signOut().subscribe( data => {
        expect(localStorage.getItem('accessToken')).toBe(null);
        expect(localStorage.getItem('client')).toBe(null);
        expect(localStorage.getItem('expiry')).toBe(null);
        expect(localStorage.getItem('tokenType')).toBe(null);
        expect(localStorage.getItem('uid')).toBe(null);
      });

      backend.expectOne({
        url: 'auth/sign_out',
        method: 'DELETE'
      });
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

    /*it('validateToken should not call signOut when it returns status 401', () => {

      const signOutSpy = spyOn(service, 'signOut');

      service.validateToken().subscribe( error => expect(signOutSpy).not.toHaveBeenCalled());

      const req = backend.expectOne({
        url: 'auth/validate_token',
        method: 'GET'
      }).flush(
        { status: 401 }
      )
    });*/

    it('updatePassword should PUT', () => {

      service.updatePassword(updatePasswordData).subscribe();

      const req = backend.expectOne({
        url: 'auth',
        method: 'PUT'
      });

      expect(req.request.body).toEqual(updatePasswordDataOutput);
    });

    it('resetPassword should POST', () => {

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

    it('signIn should POST data', () => {

      service.signIn(signInData);

      const req = backend.expectOne({
        url: 'https://localhost/myapi/myauth/mysignin',
        method: 'POST'
      });

      expect(req.request.body).toEqual(signInDataCustomOutput);
    });

    it('signOut should DELETE', () => {

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

      expect(req.request.body).toEqual(registerDataOutput);
    });

    it('validateToken should GET', () => {

      service.validateToken();

      const req = backend.expectOne({
        url: 'https://localhost/myapi/myauth/myvalidate',
        method: 'GET'
      });
    });
    
    /*it('validateToken should call signOut when it returns status 401', () => {

      mockBackend.connections.subscribe(
        c => c.mockError(new Response(new ResponseOptions({ status: 401, headers: new Headers() })))
      );

      spyOn(tokenService, 'signOut');

      tokenService.init({ apiPath: 'myapi', signOutFailedValidate: true });
      tokenService.validateToken().subscribe(res => null, err => expect(tokenService.signOut).toHaveBeenCalled());
    }));*/

    it('updatePassword should PUT', () => {

      service.updatePassword(updatePasswordData).subscribe();

      const req = backend.expectOne({
        url: 'https://localhost/myapi/myauth/myupdate',
        method: 'PUT'
      });

      expect(req.request.body).toEqual(updatePasswordDataOutput);
    });

    it('resetPassword should POST', () => {

      service.resetPassword(resetPasswordData).subscribe();

      const req = backend.expectOne({
        url: 'https://localhost/myapi/myauth/myreset',
        method: 'POST'
      });

      expect(req.request.body).toEqual(resetPasswordDataCustomOutput);
    });
  });
});

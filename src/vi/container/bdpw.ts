import { LogHandler } from '@/utilities/log-handler';
import { ViResources } from '../vi-resources';

export class BDPW {
  private static logging = new LogHandler('ViResources');

  private m_FileHasPassword = false;
  private m_VCTP: any;
  private m_VERS: any;
  private m_reader: any;
  private m_set_md5_psw = false;
  private m_isHashReadOK = false;
  private salt = '';
  public passwordMd5 = '';
  public hash1 = '';
  public hash2 = '';

  constructor(lv: ViResources) {
    this.m_FileHasPassword = true;
    const reader = lv.getResourceByName('BDPW')?.getReader(false);
    if (reader == null) {
      BDPW.logging.error('File has no password information! - Version < 5.0?');
      return;
    }

    /*
                this.m_VCTP = lv.getVCTP();
                this.m_VCTP.getError().CopyErrorsTo(this.m_error);

                this.m_VERS = lv.getVERS();
                this.m_VERS.getError().CopyErrorsTo(this.m_error);
        */

    this.passwordMd5 = reader.readHex(16);
    this.hash1 = reader.readHex(16);
    this.hash2 = reader.readHex(16);

    /*
        this.m_set_md5_psw = this.m_file_psw.password_md5;

        const hash = this.getHash(this.m_file_psw.password_md5, true);
        this.m_file_psw.salt = hash.salt;

        this.m_isHashReadOK = hash.isOK;
        if (!hash.isOK) this.m_error.addError('Unable to detect the salt!');
        */
  }
  /*

        private getHash(md5password: string, checkSalt: boolean = false): { salt: string, hash1: string, hash2: string, isOK: boolean } {
            let BDH__content: any = null;
            const LVSR_content: any = {};

            const out = { salt: '', hash1: '', hash2: '', isOK: false };
            let data = '';

            const lv = this.m_lv;

            if (this.m_lv.BlockNameExists('BDHc')) {
                BDH__content = lv.getBlockContent('BDHc');
            } else if (this.m_lv.BlockNameExists('BDHP')) {
                BDH__content = lv.getBlockContent('BDHP');
            } else {
                out.isOK = false;
                return out;
            }

            //----
            //- get LVSR container
            if (lv.BlockNameExists('LVSR')) {
                LVSR_content = lv.getBlockContent('LVSR');
            }

            //----
            if (BDH__content === null) {
                out.isOK = false;
                return out;
            }

            //----
            //- get Salt
            if (checkSalt === true) {
                //- find salt
                out.salt = '';
                if (BDH__content.hasOwnProperty('Salt')) {
                    out.salt = BDH__content.Salt;
                }
                if (out.salt.length === 0) {
                    if (LVSR_content.hasOwnProperty('Salt')) {
                        out.salt = LVSR_content.Salt;
                    }
                }
            }

            //----
            //- password hash
            out.hash1 = '';
            out.hash2 = '';

            if (BDH__content.hasOwnProperty('Hash1')) {
                out.hash1 = BDH__content.Hash1;
            }
            if (BDH__content.hasOwnProperty('Hash2')) {
                out.hash2 = BDH__content.Hash2;
            }

            //----
            //- password ok
            out.isOK = true;
            if (md5password.length > 0) {
                //- compare with given password
                data = out.salt + md5password;
                if (out.hash1 !== md5_hex(data)) {
                    out.isOK = false;
                }
                if (out.hash2 !== md5_hex(out.hash1 + md5password)) {
                    out.isOK = false;
                }
            }

            return out;
        }
    */

  /*
        public getPasswordHash(seperator = '') {
            if (this.m_file_psw) {
                return this.m_lv.toHex(this.m_file_psw['password_md5'], seperator);
            }

            return '';
        }
        */
  /*
        private toHex(s: string) {
            let result = '';
            for (let i = 0; i < s.length; i++) {
                const hex = s.charCodeAt(i).toString(16);
                result += ("000" + hex).slice(-4);
            }

            return result;
        }
        */
  /*
        public getXML(): string {
            let out = "<BDPW>\n";

            out += `  <hash type='password' value='${this.toHex(this.m_file_psw.password_md5)}' /> \n`;
            out += `  <hash type='hash1' value='${this.toHex(this.m_file_psw.hash_1)}' /> \n`;

            if (this.m_file_psw['hash_2'] != '') {
                out += `  <hash type='hash2' value='${this.toHex(this.m_file_psw.hash_2)}' /> \n`;
            }

            if (this.m_file_psw['salt'] != '') {
                out += `  <salt value='${this.toHex(this.m_file_psw.salt)}' /> \n`;
            }

            out += this.m_error.getXML();

            out += "</BDPW>\n";

            return out;
        }
    */
}

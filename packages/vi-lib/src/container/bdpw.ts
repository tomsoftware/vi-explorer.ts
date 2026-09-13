import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';


export class BDPW {
  private static logging = new Logger('BDPW');

  public passwordHash: Uint8Array;
  public hash1: Uint8Array;
  public hash2: Uint8Array;


  constructor(reader: VirtualFile | null) {
    if (reader == null) {
        BDPW.logging.error('File has no password information! - Version < 5.0?');

        this.passwordHash = new Uint8Array(0);
        this.hash1 = new Uint8Array(0);
        this.hash2 = new Uint8Array(0);
        return;
    }

    this.passwordHash = reader.readBytes(16);
    this.hash1 = reader.readBytes(16);
    this.hash2 = reader.readBytes(16);

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

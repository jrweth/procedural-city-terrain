/**
 * Class to define the mapping of one string to another
 */
export interface XRule {
  apply(input: string, params: any) : string;
}